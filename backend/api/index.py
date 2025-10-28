'''
Business: API для управления услугами, заявками и настройками сайта EasyAdventure
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            if path == 'settings':
                cur.execute('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1')
                settings = cur.fetchone()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(settings) if settings else {}, default=str)
                }
            
            elif path == 'services':
                cur.execute('SELECT * FROM services ORDER BY created_at DESC')
                services = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(s) for s in services], default=str)
                }
            
            elif path == 'orders':
                cur.execute('''
                    SELECT o.*, s.title as service_title 
                    FROM orders o 
                    LEFT JOIN services s ON o.service_id = s.id 
                    ORDER BY o.created_at DESC
                ''')
                orders = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(o) for o in orders], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'order':
                cur.execute(
                    '''INSERT INTO orders (service_id, phone, uid, telegram, status) 
                       VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                    (body_data['service_id'], body_data['phone'], body_data['uid'], 
                     body_data['telegram'], 'pending')
                )
                order_id = cur.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'order_id': order_id})
                }
            
            elif path == 'service':
                cur.execute(
                    '''INSERT INTO services (title, description, requirements, price) 
                       VALUES (%s, %s, %s, %s) RETURNING id''',
                    (body_data['title'], body_data['description'], 
                     body_data['requirements'], body_data['price'])
                )
                service_id = cur.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'service_id': service_id})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'settings':
                cur.execute(
                    '''UPDATE site_settings 
                       SET site_name = %s, site_description = %s, contact_telegram = %s, 
                           updated_at = CURRENT_TIMESTAMP 
                       WHERE id = 1''',
                    (body_data['site_name'], body_data['site_description'], 
                     body_data['contact_telegram'])
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif path == 'order_status':
                cur.execute(
                    'UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                    (body_data['status'], body_data['order_id'])
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif path == 'service':
                cur.execute(
                    '''UPDATE services 
                       SET title = %s, description = %s, requirements = %s, price = %s,
                           updated_at = CURRENT_TIMESTAMP 
                       WHERE id = %s''',
                    (body_data['title'], body_data['description'], 
                     body_data['requirements'], body_data['price'], body_data['id'])
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'DELETE':
            service_id = event.get('queryStringParameters', {}).get('id', '')
            
            if path == 'service' and service_id:
                cur.execute('UPDATE services SET title = title WHERE id = %s', (service_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Not found'})
        }
    
    finally:
        cur.close()
        conn.close()