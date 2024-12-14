import React, { useState } from 'react';
import * as firebaseFunctions from '../../firebase/firebaseFunctions';
import { Timestamp } from 'firebase/firestore';

const AdminEventForm = ({ user, onEventAdded }) => {
  const [eventData, setEventData] = useState({
    title: '',
    type: 'social',
    description: '',
    capacity: 0,
    date: '',
    address: '',
    location: {
      latitude: 0,
      longitude: 0
    },
    image: null
  });

  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for nested location and numeric fields
    if (name === 'location.latitude' || name === 'location.longitude') {
      setEventData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name.split('.')[1]]: parseFloat(value)
        }
      }));
    } else if (name === 'capacity') {
      setEventData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Upload image if exists
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await firebaseFunctions.upload(imageFile);
      }

      // Prepare event data
      const finalEventData = {
        ...eventData,
        date: Timestamp.fromDate(new Date(eventData.date)),
        image: imageUrl,
        userId: user.uid
      };

      // Add event
      await firebaseFunctions.addEvent(finalEventData);
      
      // Optional: callback to refresh events or show success message
      if (onEventAdded) {
        onEventAdded();
      }

      // Reset form
      setEventData({
        title: '',
        type: 'social',
        description: '',
        capacity: 0,
        date: '',
        address: '',
        location: {
          latitude: 0,
          longitude: 0
        },
        image: null
      });
      setImageFile(null);

      alert('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={eventData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="social">Social</option>
            <option value="coding">Coding</option>
            <option value="music">Music</option>
            <option value="day out">Day Out</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={eventData.capacity}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="datetime-local"
            name="date"
            value={eventData.date}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={eventData.address}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            name="location.latitude"
            value={eventData.location.latitude}
            onChange={handleInputChange}
            step="0.000001"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            name="location.longitude"
            value={eventData.location.longitude}
            onChange={handleInputChange}
            step="0.000001"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add Event
        </button>
      </form>
    </div>
  );
};

export default AdminEventForm;