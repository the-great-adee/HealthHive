# The Online Medical Consultation System

The OMCS is an online service that allows patients and doctors to effectively communicate with each other from the comfort of their homes. It provides necessary facilities of consultation booking, physical appointment booking, providing online prescriptions, and a two-way feedback system.

## How to run the application locally

Clone the repository onto your desktop and navigate to the root directory. Run the command `npm i` to install all the necessary dependencies.

IMPORTANT: If you are using a local MongoDB database, do not forget to run the `mongod` command before starting the application.

After this, in the project directory, you can run the application using:

### `npm run dev`

Runs the app in the development mode and runs the backend server.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

Make sure you use Node.js with version 20+.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Dependencies

Some of the important dependencies used in this project are:
1) `express (v4.19.1)`: A Node.js web application framework that provides a set of features for building web applications. Mainly used for the backend.
2) `mongoose (v8.2.1)`: An Object Data Modelling (ODM) tool for MongoDB and Node.js.
3) `react (v18.2.0)`: A frontend library for building user interfaces. It is declarative, component-based, and efficient. React makes it easy to create interactive UIs by using a declarative approach to programming.
4) `tailwindcss (v3.4.1)`: An open-source CSS framework that allows users to build websites without leaving their HTML
5) `dotenv (v16.4.5)`: A highly important package to process environment variables, whose setup has been explained below.
6) `nodemon (v3.1.0)`: A javascript file executor that restarts with changes in the source file.
7) `concurrently (v8.2.2)`: A package used to run multiple scripts together. Here it is used to run the frontend and the backend servers together.
8) `bcrypt (v5.1.1)`: Used for encrypting the user passwords before storing them in the database.

## Environment Variables
You need to create a  `.env` file in the root directory of the project. This should have the following content:

```bash
MONGO_URI = # any MongoDB database URI. For testing, we recommend you to use mongodb://localhost:27071/omcs (this will locally create an OMCS database for you)
JWT_SECRET = # use the jwt_secret_gen.js file in the backend directory of the folder and paste the output here
EMAIL = omcs.seproject@gmail.com
APP_PASSWORD = # contact us to fill this field
```

## Features of the application
### For patients
- Filter and View Doctors
- Book Consultations
- View Pending Consultations
- View Booked Appointment Details
- Receive online prescription via email
- Provide Feedback for completed consultations
- Receive important email notifications
### For Doctors
- Update working hours, location, clinic etc.
- View incoming consultation requests
- Reject consultations
- Book a physical appointment with the patient
- Send an online prescription
- Receive notifications when a patient provides a feedback
- Reply to the beforementioned feedback

## Credits
### For any querries, bugs or doubts, please contact any of the three contributors:
1) [`Sharanya Chakraborty`](https://github.com/destryptor)
2) [`T. Shiva Chaitanya`](https://github.com/shivachaits)
3) [`Jatin Mahawar`](https://github.com/jatinsm2023)
