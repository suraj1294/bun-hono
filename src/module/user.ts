import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";

class User {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async addUser(user: schema.NewUser) {
    return this.db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing()
      .returning();
  }

  async checkUser(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async getById(id: number) {
    return this.db
      .select({
        name: schema.users.fullName,
        email: schema.users.email,
        role: schema.users.role,
        phone: schema.users.phone,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));
  }

  async getAll() {
    return this.db
      .select({
        name: schema.users.fullName,
        email: schema.users.email,
        role: schema.users.role,
        phone: schema.users.phone,
      })
      .from(schema.users);
  }
}

const userService = new User(db);

export default userService;
