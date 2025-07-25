# trainee-fighting-25t1

## Repo Usage:

### Mono Repo Guide

new repo

As you can see this project has the following folders:

- `backend`: for the Node TS backend code

- `frontend`: for the React TSX / Vite frontend code

- `shared`: For any code or interfaces we don't want to duplicate between between the `frontend` and `backend` repos.

## Frontend:

### Inital Setup

1. Enter into `frontend` folder, either by opening the folder in your IDE, or running `cd frontend`

2. run `npm install` to install all of the relavent packages.


### Running frontend

To run the frontend locally you should be able to run

1.  `npm run dev`
This should provide the URL required to visualise your frontend code.


## Backend

### Note:

For the setup of the backend repo I roughly followed [this tutorial](https://blog.logrocket.com/express-typescript-node/).

Note the main difference is our 'models' are stored in the shared folder.

### Inital Setup

1. Enter into `backend` folder, either by opening the folder in your IDE, or running `cd frontend`

2. Run `npm install`

### Running Backend

To run a development version of the server which restarts each time you edit a file run:
- `npm run dev`

- This is useful if you want to quickly test changes without needing to restart the server.

To run the production version of the server which will simulate what the server will be like whilst it is running, use:

- ` npm run start` or `npm start`

- This is for example useful if you want to test if a specific command might crash the server.

These scripts are defined in the **package.json** file, 