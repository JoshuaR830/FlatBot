# Deployment Dude
- A Discord bot used for managing deployment

# Actions
* check pending - check if there is already someting in testing environment
* set pending <branch> - gets specified branch ready to deploy to test
* deploy pending - spins up a container for the specified branch
* confirm pending - tears down live container and creates a new one with the new code