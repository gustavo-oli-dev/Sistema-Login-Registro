import os
import sys
from datetime import datetime
import random

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app)

admin_user = {
    'id': 0,
    'nome': 'Administrador',
    'email': 'admin@gmail.com',
    'senha': generate_password_hash('1234'),
    'data_criacao': datetime.now().isoformat(),
    'is_admin': True,
}

users_db = [admin_user]
MIN_PASSWORD_LENGTH = 4


def password_has_whitespace(password):
    return any(char.isspace() for char in password)


def password_is_too_short(password):
    return len(password) < MIN_PASSWORD_LENGTH


def generate_user_id():
    existing_ids = {user['id'] for user in users_db}
    while True:
        user_id = random.randint(1000000, 9999999)
        if user_id not in existing_ids:
            return user_id


def is_main_admin(user):
    return user['id'] == admin_user['id']


def is_admin_user(user):
    return user.get('is_admin', False)


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json

    if not data or 'email' not in data or 'senha' not in data or 'nome' not in data:
        return jsonify({'erro': 'Email, senha e nome são obrigatórios'}), 400

    email = data['email'].strip()
    senha = data['senha']
    nome = data['nome'].strip()

    if any(user['email'] == email for user in users_db):
        return jsonify({'erro': 'Email já cadastrado'}), 400

    if password_is_too_short(senha):
        return jsonify({'erro': f'Senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres'}), 400

    if password_has_whitespace(senha):
        return jsonify({'erro': 'Senha não pode conter espaços'}), 400

    new_user = {
        'id': generate_user_id(),
        'nome': nome,
        'email': email,
        'senha': generate_password_hash(senha),
        'data_criacao': datetime.now().isoformat(),
        'is_admin': False,
    }

    users_db.append(new_user)

    return jsonify({
        'mensagem': 'Usuário registrado com sucesso',
        'usuario': {
            'id': new_user['id'],
            'nome': new_user['nome'],
            'email': new_user['email'],
        }
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json

    if not data or 'email' not in data or 'senha' not in data:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    email = data['email'].strip()
    senha = data['senha']

    user = next((u for u in users_db if u['email'] == email), None)

    if not user or not check_password_hash(user['senha'], senha):
        return jsonify({'erro': 'Email ou senha inválidos'}), 401

    return jsonify({
        'mensagem': 'Login realizado com sucesso',
        'usuario': {
            'id': user['id'],
            'nome': user['nome'],
            'email': user['email'],
            'is_admin': user['is_admin'],
        }
    }), 200


@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios_publicos = [
        {
            'id': u['id'],
            'nome': u['nome'],
            'email': u['email'],
            'data_criacao': u['data_criacao'],
            'is_admin': u['is_admin'],
        }
        for u in users_db
    ]
    return jsonify(usuarios_publicos), 200


@app.route('/api/usuarios/<int:user_id>', methods=['GET'])
def obter_usuario(user_id):
    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    return jsonify({
        'id': user['id'],
        'nome': user['nome'],
        'email': user['email'],
        'data_criacao': user['data_criacao'],
        'is_admin': user['is_admin'],
    }), 200


@app.route('/api/usuarios/<int:user_id>', methods=['PUT'])
def atualizar_usuario(user_id):
    data = request.json

    if not data:
        return jsonify({'erro': 'Dados são obrigatórios'}), 400

    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if 'nome' in data:
        nome = data['nome'].strip()
        if nome:
            user['nome'] = nome

    if 'email' in data:
        novo_email = data['email'].strip()
        if novo_email and novo_email != user['email']:
            if any(u['email'] == novo_email for u in users_db):
                return jsonify({'erro': 'Email já está em uso'}), 400
            user['email'] = novo_email

    return jsonify({
        'mensagem': 'Usuário atualizado com sucesso',
        'usuario': {
            'id': user['id'],
            'nome': user['nome'],
            'email': user['email'],
        }
    }), 200


@app.route('/api/usuarios/<int:user_id>', methods=['DELETE'])
def deletar_usuario(user_id):
    global users_db

    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if is_main_admin(user):
        return jsonify({'erro': 'Não é possível deletar o administrador principal'}), 403

    users_db = [u for u in users_db if u['id'] != user_id]

    return jsonify({'mensagem': 'Usuário deletado com sucesso'}), 200


@app.route('/api/usuarios/<int:user_id>/promover', methods=['POST'])
def promover_admin(user_id):
    data = request.json
    admin_id = data.get('admin_id') if data else None

    admin = next((u for u in users_db if u['id'] == admin_id), None)

    if not admin:
        return jsonify({'erro': 'Admin não encontrado'}), 404

    if not is_admin_user(admin) and not is_main_admin(admin):
        return jsonify({'erro': 'Apenas admins podem promover usuários'}), 403

    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if user['is_admin']:
        return jsonify({'erro': 'O usuário já é um administrador'}), 400

    user['is_admin'] = True

    return jsonify({'mensagem': 'Usuário promovido a administrador com sucesso'}), 200


@app.route('/api/usuarios/<int:user_id>/rebogar', methods=['POST'])
def rebogar_privilegios(user_id):
    data = request.json
    admin_id = data.get('admin_id') if data else None

    admin = next((u for u in users_db if u['id'] == admin_id), None)

    if not admin:
        return jsonify({'erro': 'Admin não encontrado'}), 404

    if is_main_admin(user):
        return jsonify({'erro': 'Não é possível rebogar o administrador principal'}), 403

    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if not user['is_admin']:
        return jsonify({'erro': 'O usuário não é um administrador'}), 400

    user['is_admin'] = False

    return jsonify({'mensagem': 'Privilégios de admin removido com sucesso'}), 200


@app.route('/api/auth/info', methods=['GET'])
def info():
    return jsonify({
        'total_usuarios': len(users_db),
        'total_admins': sum(1 for u in users_db if u['is_admin']),
        'usuarios_no_bd': len(users_db)
    }), 200


@app.route('/api', methods=['GET'])
def root():
    return jsonify({
        'status': 'ok',
        'mensagem': 'API de Login e Registro funcionando'
    }), 200


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200
