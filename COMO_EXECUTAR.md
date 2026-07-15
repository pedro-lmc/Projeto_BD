# Como rodar

Precisa do PostgreSQL rodando (usei Docker).

Subir o container:
```
docker run --name pg-hospital -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hospital_yuska -p 5432:5432 -d postgres:16
```

Copiar os scripts pro container e rodar:
```
docker cp 01_create_tables.sql pg-hospital:/01_create_tables.sql
docker cp 02_insert_test_data.sql pg-hospital:/02_insert_test_data.sql

docker exec -it pg-hospital psql -U postgres -d hospital_yuska -f /01_create_tables.sql
docker exec -it pg-hospital psql -U postgres -d hospital_yuska -f /02_insert_test_data.sql
```

Conferir se inseriu certo:
```
docker exec -it pg-hospital psql -U postgres -d hospital_yuska -c "SELECT COUNT(*) FROM PACIENTE;"
```
tem que dar 5.

Da próxima vez não precisa rodar o `docker run` de novo, só:
```
docker start pg-hospital
```
