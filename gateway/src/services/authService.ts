import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUser } from "../repositories/userRepository";

export async function registerUser(username: string, password: string) {
    const user = findUser(username);
    if (user) {
        throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    createUser(username, hashed);
    return { message: "User registered successfully" };
}

export async function loginUser(username: string, password: string) {
    const user = findUser(username);
    if (!user)
        throw new Error("Invalid username or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        throw new Error("Invalid username or password");

    const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    return { token };
}