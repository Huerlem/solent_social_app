import React, {useState, useEffect } from 'react';
import Event from './Event.jsx';
import { searchEvent } from '../lib/firebase/searchEvent.js';


export default function EventList = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const[events, setEvents]= useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const eventsData = await searchEvent();
                setEvents(eventsData);
                setLoading(false);
            }catch ( error) {
                console.error('Error loading event: ', error);
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    if (loading) {
        return <p>Loading eventos...</p>;
    }

    if (filteredEvents.length === 0) {
        return <p>Nenhum evento encontrado.</p>;
    }

    return (
        <div>
            <input type="text" placeholder="Search Events" value={searchTerm} onChange={handleSearch} />
            <ul>
                {filteredEvents.map((event) => (
                    <li key={event.id}>
                        <Event {...event} />
                    </li>
                ))}
            </ul>
        </div>
    );
};