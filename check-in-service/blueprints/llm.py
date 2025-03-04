from flask import Blueprint, request

llm_bp = Blueprint('llm', __name__)

@llm_bp.route('/receive', methods=['POST'])
def receive_llm():
    data = request.get_data()
    print("received data")
    print(data)
    
    return 'OK'