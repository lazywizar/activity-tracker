# activity-tracker
A simple webapp to track your key goals

# Execution
npm install
npm run dev
# Local Deployment

To test the application locally, follow these steps:
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/activity-tracker.git
   cd activity-tracker
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Open the application in your browser:**
   Navigate to `http://localhost:3000` in your web browser to see the application running.

5. **Run tests:**
   To run the tests, use the following command:
   ```sh
   npm test
   ```

6. **Build for production:**
   To create a production build, use the following command:
   ```sh
   npm run build
   ```

7. **Start the production server:**
   After building the application, you can start the production server with:
   ```sh
   npm start
   ```

8. **Lint the code:**
   To check for linting errors, use the following command:
   ```sh
   npm run lint
   ```

9. **Format the code:**
   To format the code using Prettier, use the following command:
   ```sh
   npm run format
   ```

10. **Environment Variables:**
    Make sure to set up the necessary environment variables. Create a `.env` file in the root directory and add the required variables as shown in the `.env.example` file.

    ```sh
    cp .env.example .env
    ```

    Update the `.env` file with your specific configuration.

Now you are ready to test and develop the application locally!


## Status Page
https://stats.uptimerobot.com/wrQ5akfDYW

## GCP Deployment
### Client
cd client
gcloud builds submit --tag gcr.io/mymomentumapp/momentum-client
cd ..

### Server
cd server
gcloud builds submit --tag gcr.io/mymomentumapp/momentum-server
cd ..

gcloud run deploy momentum-client \
  --image gcr.io/mymomentumapp/momentum-client \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 1

gcloud run deploy momentum-server \
  --image gcr.io/mymomentumapp/momentum-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 1
