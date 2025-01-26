'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../../firebase/firebaseClient';
import { db } from '../../firebase/firebaseClient';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function EventForm({ event, onSuccess }) {
    const router = useRouter();
    const [imageUpload, setImageUpload] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
    const [formError, setFormError] = useState(null);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            title: event?.title || '',
            description: event?.description || '',
            type: event?.type || '',
            location: {
                latitude: event?.location?.latitude || '',
                longitude: event?.location?.longitude || '',
            },
            capacity: event?.capacity || '',
            image: event?.image || '',
            address: event?.address || '',
            date: event?.date ? new Date(event.date.seconds * 1000).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        },
    });

    useEffect(() => {
        register('image', { required: false });
        if (imageUrl) {
            setValue('image', image);
        }
    }, [register, imageUrl, setValue]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        try {
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                toast.error('Please use only PNG or JPEG images');
                return;
            }
    
            if (file.size > 5 * 1024 * 1024) {
                toast.error('The image must be less than 5MB!');
                return;
            }
    
            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
    
            setImageUpload(file);
            setValue('imageUrl', '');
        } catch (error) {
            console.error('Error Loading Image:', error);
            toast.error('Error Loading Image');
        }
    };
    
    const uploadImage = async (file) => {
        const storage = getStorage();
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `event-images/${fileName}`);
    
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'web-app'
            }
        };
    
        try {
            const snapshot = await uploadBytesResumable(storageRef, file, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error Uploading:', error);
            throw new Error('Failed Uploading Image!');
        }
    };
    
    const onSubmit = async (data) => {
        setFormError(null);
        let downloadURL = imageUrl;
    
        try {
            if (imageUpload) {
                setUploadProgress(0);
                downloadURL = await uploadImage(imageUpload);
            }
    
            const eventData = {
                ...data,
                image: downloadURL,
                date: new Date(data.date), 
                address: data.address,
                updatedAt: new Date(),
                ...(event ? {} : { createdAt: new Date() })
            };
    
            if (event) {
                const eventRef = doc(db, 'events', event.id);
                await setDoc(eventRef, eventData, { merge: true });
                toast.success('Event Updated Successfully!');
            } else {
                await addDoc(collection(db, 'events'), eventData);
                toast.success('Event Created Successfully!');
            }
    
            router.push('/admin');
        } catch (error) {
            console.error('Erro:', error);
            toast.error(error.message || 'Error to save an Event.');
            setFormError('Erroro to save an event. Please, try again.');
        }
    };
    
    

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded-lg shadow-md">
            {formError && <p className="text-red-500">{formError}</p>}
            <div>
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
                <input
                    type="text"
                    id="title"
                    {...register("title", { required: "Title is Required!" })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <label htmlFor="description" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Description</label>
                <textarea
                    id="description"
                    {...register("description", { required: "Description is Required!" })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <label htmlFor="type" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Type</label>
                <select id="type" {...register("type", { required: "Tipo é obrigatório" })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option value="">All Types</option>
                    <option value="social">Social</option>
                    <option value="coding">Coding</option>
                    <option value="music">Music</option>
                    <option value="day out">Day Out</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
            </div>
            <div>
                <label htmlFor="capacity" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Capacity</label>
                <input
                    type="number"
                    id="capacity"
                    {...register("capacity", { required: "Capacity is Required!", min: { value: 1, message: "Capacidade deve ser maior que zero" } })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
            </div>

            <div>
                <label htmlFor="latitude" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Latitude</label>
                <input
                    type="text"
                    id="latitude"
                    {...register("location.latitude", { required: "Latitude is Required!" })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.location?.latitude && <p className="text-red-500 text-sm mt-1">{errors.location.latitude.message}</p>}
            </div>
            <div>
                <label htmlFor="longitude" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Longitude</label>
                <input
                    type="text"
                    id="longitude"
                    {...register("location.longitude", { required: "Longitude is required!" })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.location?.longitude && <p className="text-red-500 text-sm mt-1">{errors.location.longitude.message}</p>}
            </div>

            <div>
                <label htmlFor="address" className="block mt-4 mb-2 text-sm font-medium text-gray-900">
                    Address
                </label>
                <input
                    type="text"
                    id="address"
                    {...register("address", { required: "Endereço is Required!" })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Ex: 206-208 Tower Bridge Rd, London SE1 2LL"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div>
                <label htmlFor="date" className="block mt-4 mb-2 text-sm font-medium text-gray-900">
                    Date/Time
                </label>
                <input
                    type="datetime-local"
                    id="date"
                    {...register("date", { 
                        required: "Date and Time is Required!",
                        validate: (value) => {
                            const date = new Date(value);
                            return date > new Date() || "The data must be in the future!";
                        }
                    })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
                <label htmlFor="image" className="block mt-4 mb-2 text-sm font-medium text-gray-900">Image</label>
                <input type="file" id="image" onChange={handleImageUpload} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full" />
                {imageUrl && (
                    <div className="mt-2">
                        <img src={imageUrl} alt="Event Image" className="max-w-xs" />
                    </div>
                )}
                {uploadProgress > 0 && <progress value={uploadProgress} max="100" className="w-full mt-2" />}
                {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
            </div>

            <button
                type="submit"
                disabled={uploadProgress > 0 && uploadProgress < 100}
                className={`mt-6 ${uploadProgress > 0 && uploadProgress < 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            >
                {event ? 'Save Changes' : 'Create an Event'}
            </button>
        </form>
    );
}


