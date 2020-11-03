# deno_nes

An NES emulator written in TypeScript for the Deno runtime.

This is being written as I follow along with [this ebook](https://bugzmanov.github.io/nes_ebook).

As the original material was written for Rust, I am converting things to TypeScript as I encounter problems (such as the lack of multiple numeric types).

Tests are located in `__tests__/`.

## Running Tests

 - Clone the repo and run:
 ```
 deno test __tests__/
 ```
 - Run a test directly from the repo:
 ```
 deno test https://raw.githubusercontent.com/envis10n/deno_nes/master/__tests__/cpu.test.ts
 ```