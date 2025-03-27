import argon2, { Algorithm } from '@node-rs/argon2'

const option = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 2 ** 16,
  timeCost: 4,
  parallelism: 2
}

export const hashPassword = async (password: string) => argon2.hash(password, option)
export const comparePassword = async (password: string, hash: string) => argon2.verify(hash, password)
