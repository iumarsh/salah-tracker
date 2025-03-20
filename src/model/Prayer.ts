import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrayer extends Document {
    userId: mongoose.Types.ObjectId;
    date: string; // YYYY-MM-DD format
    fajr: string; // 'masjid' | 'home' | 'qaza' | 'missed'
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    createdAt: Date;
}

const PrayerSchema: Schema<IPrayer> = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        fajr: { type: String, enum: ['masjid', 'home', 'qaza', 'missed'], default: 'missed' },
        zuhr: { type: String, enum: ['masjid', 'home', 'qaza', 'missed'], default: 'missed' },
        asr: { type: String, enum: ['masjid', 'home', 'qaza', 'missed'], default: 'missed' },
        maghrib: { type: String, enum: ['masjid', 'home', 'qaza', 'missed'], default: 'missed' },
        isha: { type: String, enum: ['masjid', 'home', 'qaza', 'missed'], default: 'missed' },
    },
    { timestamps: true }
);

const Prayer: Model<IPrayer> = mongoose.models.Prayer || mongoose.model<IPrayer>('Prayer', PrayerSchema);
export default Prayer;
