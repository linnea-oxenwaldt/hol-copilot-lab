interface HoHoHoModalProps {
    onClose: () => void;
}

const HoHoHoModal = ({ onClose }: HoHoHoModalProps) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Ho Ho Ho!</h2>
                <button onClick={onClose} className="merry-christmas-btn">Merry Christmas</button>
            </div>
        </div>
    );
};

export default HoHoHoModal;
