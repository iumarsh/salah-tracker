import mongoose from 'mongoose'

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("DB already connected")
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || "")
        connection.isConnected = db.connections[0].readyState

        console.log("Db connected Successfully")

    } catch (error) {
        console.error('Db connection failed', error)
        process.exit(1)
    }
}

export default dbConnect;