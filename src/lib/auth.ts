import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
        adminCode: { label: '管理者コード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Dynamic import to avoid edge runtime issues
        const { prisma } = await import('@/lib/db')
        const bcrypt = await import('bcryptjs')

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) return null
        const isAdmin = credentials.adminCode === 'akirakudo'
        return { id: user.id, name: user.name, email: user.email, isAdmin }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
      }
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      session.user.isAdmin = (token.isAdmin as boolean) ?? false
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
