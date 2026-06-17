# DevConnect APIs

## AuthRouter
- POST / signup
- POST / login
- POST / logout


## ProfileRouter
- GET  / profile/view
- PATCH / profile/edit
- PATCH / profile/ password


## connectionRequestRouter
- POST/ request/send/interested/:userId
- POST/ requrest/send/ignored/:userId
- POST/ request/review/accepted/:requestId
- POST/ request/review/rejected/:requestId


## userRouter
- GET/user/connections
- GET/user/request/received
- GET/user/feed - GET profiles of other users on the platform





Status: ignore, interested, accepted, rejected

