# Inverter Manager

This is an application that can help you manage your inverters that are connected to the network.

## Environments

### Data store

Below it will show all the environments that need to be present for certain data stores.

---

__In memory storage__

This will save all the data in memory. If the application is restart all the data will be lost. This could be useful during testing.
```env
STORE_TYPE=memory # This is the default value can be left out.
```

---

__SQL database__

This will store all the data into the configured database (Will not try to create the database by itself, it already has to exist, it will set up all the tables.).
```env
STORE_TYPE=mysql

STORE_HOST=localhost
STORE_PORT=3306
STORE_DATABASE=inverter_database
STORE_USER=<user_name>
STORE_PASS=<password>
```

## Build

### Build the frontend

Run following in the `./frontend` folder.

```shell
npm run build
```

### Build the backend

Run following in the `./backend` folder.

```shell
npm run build
```

### Build docker image

```shell
docker build -t inverter-manager:latest .
```

## Development

### How to run the application in development mode

Copy the `.env.example` to `.env`

Run the backend and the frontend

```shell
# ./backend
npm start
# OR npm run watch

# ./frontend
npm start
```