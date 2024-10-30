## Description

This is a web scraper API. 
It runs a local container MongoDB instance and a local api App to retrieve certain information from a given URL

## Requeriments

node v22.6.0 - [Node official page](https://nodejs.org/en/download/package-manager) </br>
npm v10.8.2 - [NPM docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) </br>
docker desktop - [Docker desktop](https://www.docker.com/) 

## Project setup

1- After cloning the repository rename the current .env.example file's name to .env (.env information should never be shared since it is meant to protect sensitive information, but since this is a test we will use it)  </br>
2- Run ``` npm install ``` to install the node dependencies  </br>
3- (You must have installed and opened docker desktop for this step) Run ``` docker compose run -d ``` to initialize the containers [MongoDb]  </br>

This will run a local container with an instance of mongoDB (in port 27017)

4- Launch ``` npm run start ``` in the console of the project to start the server in port 3000

## Usage

This methods will initialize a instance of the server in port 3000. The port has 4 endpoints:

@POST (/scrape, {body: {url: "example.com"}}):

This endpoint receives an url as body parameter and stores in database the next information:
- The page url
- Page title
- Random < p > text
- Random < img > src (if exists)
- A boolean that will sor that a page migth be or not an 404 error. (The scraping endpoint detect the 404 error in header, but some pages migth not return this error, so the scraper will try to find 404 texts on the content)

@GET (/scrape/urls)
Returns all the urls stored in the database

@GET (scrape?url=example.com)
Returns the complete information of the provided url

@DELETE (/scrape)
Deletes all the information of the database and returns an ok message

## Ways of usage

There are two ways to manually test the server:

1- Using a testing tool like PostMan: I provide a collection that contains the endpoints and examples of usage. 

[Scrapper.postman_collection.json](https://github.com/user-attachments/files/17531033/Scrapper.postman_collection.json)

2- Using CURL commands in console:

You can interact with the server using curl commands:

@POST:

curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

@GET:

curl http://localhost:3000/scrape/urls

@GET(url):

curl "http://localhost:3000/scrape?url=https://example.com"


