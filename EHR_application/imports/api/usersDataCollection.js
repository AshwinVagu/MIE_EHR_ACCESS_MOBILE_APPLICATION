// imports/api/usersDataCollection.js
import { Mongo } from 'meteor/mongo';

export const UsersData = new Mongo.Collection('users_data');
