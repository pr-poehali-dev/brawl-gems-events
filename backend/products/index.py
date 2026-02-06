import json
import os
import psycopg2
import base64
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления товарами: создание, получение списка товаров"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        db_url = os.environ['DATABASE_URL']
        schema = os.environ['MAIN_DB_SCHEMA']
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            seller_name = body.get('seller_name', 'Анонимный продавец')
            title = body.get('title')
            description = body.get('description', '')
            price = body.get('price')
            card_number = body.get('card_number', '')
            images_base64 = body.get('images', [])
            
            if not title or not price:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название и цена обязательны'}),
                    'isBase64Encoded': False
                }
            
            uploaded_urls = []
            if images_base64:
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                )
                
                for idx, img_data in enumerate(images_base64[:5]):
                    try:
                        img_bytes = base64.b64decode(img_data.split(',')[1] if ',' in img_data else img_data)
                        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                        key = f'products/{timestamp}_{idx}.jpg'
                        
                        s3.put_object(
                            Bucket='files',
                            Key=key,
                            Body=img_bytes,
                            ContentType='image/jpeg'
                        )
                        
                        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                        uploaded_urls.append(cdn_url)
                    except Exception:
                        pass
            
            cursor.execute(
                f"INSERT INTO {schema}.products (seller_name, title, description, price, images, card_number) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (seller_name, title, description, float(price), uploaded_urls, card_number)
            )
            product_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': product_id, 'message': 'Товар добавлен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            cursor.execute(
                f"SELECT id, seller_name, title, description, price, images, created_at "
                f"FROM {schema}.products WHERE status = 'active' "
                "ORDER BY created_at DESC LIMIT 50"
            )
            rows = cursor.fetchall()
            
            products = []
            for row in rows:
                products.append({
                    'id': row[0],
                    'seller_name': row[1],
                    'title': row[2],
                    'description': row[3],
                    'price': float(row[4]),
                    'images': row[5] or [],
                    'created_at': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'products': products}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
