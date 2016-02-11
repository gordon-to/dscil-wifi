The default user information is in db/passwd.json
To change the user password required creating an openssl digest 
    echo -n "xxxxpassword" | openssl dgst -sha256
where xxxx is the salt value stored in the user file and password is the password you want to use.