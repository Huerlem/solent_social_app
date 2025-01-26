import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

function isValidEvent(event) {
  return event && event.id && event.title && event.location && event.type;
}

function AdminDashboard() {
  const { data: events, error } = useSWR('/api/events', fetcher);

  if (error) {
    return <div className="text-red-500">Error Loading Events: {error.message}</div>;
  }

  if (!events) {
    return <div>Loading events...</div>;
  }

  const validEvents = events.filter(isValidEvent);

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir evento');
      alert('Evento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard!</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/admin/create-event" className="p-4 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
          Create New Event
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Lista de Eventos</h2>
      <ul className="space-y-4">
        {validEvents.map((event) => (
          <li key={event.id} className="p-4 bg-gray-100 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p>{event.type}</p>
              <p>Localização: {event.location?.latitude}, {event.location?.longitude}</p>
            </div>
            <div className="flex space-x-4">
              <Link href={`/admin/edit-event/${event.id}`} className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
