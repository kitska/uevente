import React from 'react';
import { userStore } from '../store/userStore';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';


const TicketModal = ({ isOpen, onClose, ticket }) => {
    if (!isOpen || !ticket) return null;

    const handleExportPdf = () => {
        const input = document.getElementById('ticket-content'); 

        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg');
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                const imgWidth = 180;
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 10;

                pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight); 
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const filename = `${ticket.event.title.replace(/\s/g, '_')}_Ticket.pdf`;
                pdf.save(filename);
            });
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30'>
            <div id="ticket-content" className='relative w-full max-w-md p-6 mx-4 text-white shadow-2xl rounded-2xl bg-gradient-to-br from-pink-300 to-purple-400'>
                
                <button onClick={onClose} className='absolute text-2xl text-white top-4 right-4 hover:text-gray-300'>
                    &times;
                </button>

                <h2 className='mb-6 text-2xl font-bold text-center'>🎟️ Your Event Ticket</h2>

                <div className='p-4 mb-6 bg-white/20 rounded-xl'>
                    <p>
                        <strong>Event:</strong> {ticket.event.title}
                    </p>
                    <p>
                        <strong>Date:</strong> {new Date(ticket.event.date).toLocaleString()}
                    </p>
                    <p>
                        <strong>Location:</strong> {ticket.event.location || 'Location will be announced'}
                    </p>
                    <p>
                        <strong>Ticket Holder:</strong> {userStore.user.fullName}
                    </p>
                </div>

                <div className='flex justify-center my-6'>
                    <img src={ticket.qrCode} alt='QR Code' className='w-48 h-48 p-2 bg-white rounded-lg' />
                </div>

                <p className='text-sm text-center opacity-80'>Please present this QR code at the event entrance.</p>
            </div>
            
            <div className='absolute bottom-6'>
                <button
                    onClick={handleExportPdf}
                    className='px-6 py-3 font-semibold text-white transition duration-300 bg-teal-500 rounded-lg shadow-md hover:bg-teal-600'
                >
                    ⬇️ Export to PDF
                </button>
            </div>
        </div>
    );
};

export default TicketModal;
