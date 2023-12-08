import uvicorn

if __name__ == '__main__':
    uvicorn.run("lawcrawl.asgi:application", reload=True)