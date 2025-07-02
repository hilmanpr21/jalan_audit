import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ReportForm.css';

export default function ReportForm({ coordinates }) {
    const [category, setCategory] = useState('safety');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setmessage] = useState('');

    // Form Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from('reports')
            .insert({
                category,
                description,
                lng: coordinates?.lng,
                lat: coordinates?.lat,
            });

        setmessage(error ? 'Error submitting report' : 'Report submitted! Thank you');
        if (!error) setDescription(''); //reset on success
        setIsSubmitting(false);
    };

    return (
        <div className="sidebar">
            <div className='sidebar-title'>
                <h3>Let's Audit!</h3>
                <p>Adjust the map pin to set the location</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                
                <p>Category:</p>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="safety">Safety</option>
                    <option value="accessibility">Accessibility</option>
                    <option value="walkability">Walkability</option>
                </select>
                <p>Detailed description:</p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting || !coordinates}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
}