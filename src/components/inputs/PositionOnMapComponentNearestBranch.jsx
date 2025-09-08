import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';

function MapClickHandler({ setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

function PositionOnMapComponentNearestBranch({ onChange = (value) => { }, value = "34.713016581849445,36.70711612702235", value2 = "34.713016581849445,36.70711612702235", title = "branch", disabled = false }) {
    const [position, setPosition] = useState([34.713016581849445, 36.70711612702235]);
    const [position2, setPosition2] = useState([34.713016581849445, 36.70711612702235]);
    const [loading, setLoading] = useState(false)
    const eventHandlers = {
        dragend(e) {
            if (!disabled) {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
            }
        },
    };
    useEffect(() => {
        onChange(position.join(','))
    }, [position])
    const handleValue = async () => {
        setLoading(true)
        if (typeof value === "string") {
            await setPosition(prev => {
                const location = value.split(',').map(Number)
                if (typeof location[0] !== "number" || typeof location[1] !== "number") {
                    return (
                        [34.713016581849445, 36.70711612702235]
                    )
                }
                else {
                    return (
                        location
                    )
                }
            })
        }
        if (typeof value2 === "string") {
            await setPosition2(prev => {
                const location = value2.split(',').map(Number)
                if (typeof location[0] !== "number" || typeof location[1] !== "number") {
                    return (
                        [34.713016581849445, 36.70711612702235]
                    )
                }
                else {
                    return (
                        location
                    )
                }
            })
        }
        setLoading(false)
    }
    useEffect(() => {
        handleValue()
    }, [])
    console.log(position);

    return (
        <MapContainer center={position} zoom={16} scrollWheelZoom={true} style={{ width: '100%', height: '500px' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                !disabled &&
                <MapClickHandler setPosition={setPosition} />
            }
            <ChangeView center={position} />
            {
                !loading &&
                <>
                    <Marker
                        position={position}
                        draggable={!disabled}
                        eventHandlers={eventHandlers}
                    >
                        <Popup>
                            <p className='relative text-lg'>{title}</p>
                            Marker position: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                        </Popup>
                    </Marker>
                    <Marker
                    position={position2}
                    draggable={!disabled}
                    eventHandlers={eventHandlers}
                >
                    <Popup>
                        <p className='relative text-lg'>الفرع الحالي</p>
                        Marker position: {position2[0].toFixed(4)}, {position2[1].toFixed(4)}
                    </Popup>
                </Marker>
                </>

            }
        </MapContainer>
    );
}

export default PositionOnMapComponentNearestBranch;
