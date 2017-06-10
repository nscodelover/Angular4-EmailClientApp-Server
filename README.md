To run server application:

1. Install Node.js platform, npm command should be available after that
2. Create new PostgreSQL database with name `crm` and set database connection options in file `./src/env.js` (based on `./src/env.example.js`)
3. Install application certificate (`server.crt` file)
4. Run `npm run install-start` to install, build and run prod version, or `npm run install-start-dev` to install, build and run dev version
5. After you will see a message `Server is running on port: 8087` you can input in your browser this url: https://localhost:8087
6. Input in login form username `admin` password `qwerty123`, this user will be created automatically

If you want to change backend url you need to configure it in frontend config (`env.json`)