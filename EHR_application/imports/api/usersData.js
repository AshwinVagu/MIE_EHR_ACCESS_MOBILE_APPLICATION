// imports/api/usersData.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { UsersData } from './usersDataCollection';

Meteor.methods({
  async 'users.insert'(user) {

    try {
      check(user, {
        user_id: String,   // From authentication system
        first_name: String,
        last_name: String,
        email: String,
        mobile: String,
        age: Number,
        height: Number,
        weight: Number,
        created_at: String,
        updated_at: String,
      });


      // Ensure uniqueness
      const existing = await UsersData.findOneAsync({ _id: user.user_id });
      if (existing) {
        throw new Meteor.Error('user-exists', 'A user with this ID already exists');
      }


      const doc = {
        _id: user.user_id,  // Assign Mongo _id explicitly
        ...user,
      };

      const insertedId = await UsersData.insertAsync(doc);
      console.log('User inserted with custom ID:', insertedId);
      return {status:"success",data: doc};

    } catch (error) {
      console.error('Error inserting user:', error);
      throw new Meteor.Error('insert-failed', error.reason || 'User insert failed');
    }
  },
  async 'users.getById'(user_id) {
    try {

    check(user_id, String);

    const user = await UsersData.findOneAsync({ _id: user_id });

    if (!user) {
      throw new Meteor.Error('user-not-found', 'No user found with this ID');
    }

    return user;
  }
  catch (error) {
    console.error('Error fetching user:', error);
    throw new Meteor.Error('fetch-failed', error.reason || 'User fetch failed');
  }
},
async 'users.update'(user) {
    check(user, {
      user_id: String,
      first_name: String,
      last_name: String,
      email: String,
      mobile: String,
      age: Number,
      height: Number,
      weight: Number,
      created_at: Match.Optional(String),
      updated_at: String,
    });

    const { user_id, ...updateFields } = user;

    const updated = await UsersData.updateAsync(
      { _id: user_id },
      { $set: updateFields }
    );

    if (updated === 0) {
      throw new Meteor.Error("not-found", "User not found");
    }

    return { success: true };
  }
});
