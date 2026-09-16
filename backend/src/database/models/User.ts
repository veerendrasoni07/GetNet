import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    picture: {
      type: String,
      default: '',
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
    },
  },
  {
    timestamps: true,
  }
);

export const User = model('User', UserSchema);
export default User;
