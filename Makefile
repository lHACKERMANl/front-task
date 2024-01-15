.PHONY: build run clean

build:
	docker build -t front .

run:
	docker run -d -p 3000:3000 front

clean:
	docker ps -q --filter ancestor=front | xargs -r docker kill
	docker images -q front | xargs -r docker rmi -f

