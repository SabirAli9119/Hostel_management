import { Link } from 'react-router-dom';
import { Alert, BedMeter, DetailList, EmptyState, Loader, PageHeader, RoomTag, StatusBadge } from '../../components/index.js';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import * as roomService from '../../services/roomService.js';

export default function RoomDetails() {
  const { user } = useAuth();
  const roomId = user.assignedRoom?._id;
  const { data, loading, error } = useFetch(
    () => (roomId ? roomService.getRoom(roomId) : Promise.resolve({ data: null })),
    [roomId]
  );
  const room = data?.room || user.assignedRoom;

  if (!roomId) {
    return (
      <>
        <PageHeader title="My room" />
        <EmptyState
          title="No room assigned yet"
          text={`The warden will assign you a ${user.roomType} room. Need it sooner? Send a room request.`}
          action={
            <Link to="/user/requests/new" className="btn btn-secondary btn-md">
              Send a request
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="My room" subtitle="Where you stay and who you share it with." />
      <Alert>{error}</Alert>
      {loading && !room ? (
        <Loader />
      ) : (
        <div className="two-col">
          <section className="panel">
            <div className="room-summary">
              <RoomTag number={room.roomNumber} large />
              <BedMeter capacity={room.capacity} occupancy={room.occupancy} />
              <DetailList
                items={[
                  { label: 'Room type', value: room.roomType },
                  { label: 'Floor', value: room.floor },
                  { label: 'Capacity', value: `${room.capacity} beds` },
                  { label: 'Occupancy', value: `${room.occupancy} filled, ${room.availableBeds ?? room.capacity - room.occupancy} free` },
                  { label: 'Room status', value: <StatusBadge value={room.status} /> },
                ]}
              />
            </div>
          </section>
          <section className="panel">
            <div className="panel-head">
              <h3>Roommates</h3>
            </div>
            {room.assignedUsers?.length ? (
              <ul className="plain-list">
                {room.assignedUsers.map((u) => (
                  <li key={u._id}>
                    <strong>{u.fullName}</strong>
                    {u._id === user._id && <span className="badge badge-active">You</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">You are the only resident in this room right now.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
