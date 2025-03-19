# Acme

## Setup
```sh
npm i
```
- make sure docker is running on your system and port 5432 is not in use

### Commands

Serve Backend
```sh
npm run start:backend
```

Serve Frontend
```sh
npm run start:ui
```

## Tasks

- Don't take more than a total of 10 hours to work on this task
- if you couldn't finish the tasks within this period still hand in your partial solution. It'll be enough
  to get to know you and your technical background.

### Backend
- Extend the `User` resource for additional properties:
  - email
  - address
  - company
  - relatedCoworkers
- The company should be an entity itself 
    - One user can belong to one company
- One user can be related to other users. Those users represent a group of workers that closely work together.
- Create a basic controller to fetch, update and create users.

### Frontend
- Create a list page and a detail page
- The list page should list the users
- The detail page should show all user details and allow for updates to each property value
  - It should be possible to create company and assign the user to that company. 
  - Disregard the related co workers for frontend matters 
- You can use the installed packages such as Angular Material and Tailwind

## Contact
If you have any questions you can contact me at <a href="mailto:yannick.boetzkes@medconomy.com">yannick.boetzkes@medconomy.com</a>