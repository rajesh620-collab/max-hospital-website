import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919949655665';

const enquiryMessage = `Hello Max Super Speciality Hospital,

I would like to know more about your healthcare services and appointment availability.

Please provide more details.

Thank you.`;

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryMessage)}`;

function WhatsAppFloatingButton() {
    return (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 lg:z-[60] group">
            <div className="absolute -top-12 right-0 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
                Chat with us on WhatsApp
            </div>

            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Max Super Speciality Hospital on WhatsApp"
                className="flex items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white pl-3 pr-4 py-3 shadow-[0_10px_25px_-8px_rgba(37,211,102,0.65)] hover:shadow-[0_16px_30px_-10px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
                <span className="hidden sm:inline text-sm font-bold tracking-wide">
                    Need Help? Chat with Us
                </span>
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                </span>
            </a>
        </div>
    );
}

export default WhatsAppFloatingButton;