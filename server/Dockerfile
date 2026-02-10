FROM rust:1.84-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release

FROM alpine:latest

RUN apk add --no-cache ca-certificates libgcc

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/doniai_nav_api .

EXPOSE 3000

CMD ["./doniai_nav_api"]