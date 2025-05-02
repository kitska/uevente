import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const morphText = (text) => {
  // Разделяем текст на символы, но оставляем пробелы как отдельные элементы
  return text.split('').map((char, i) => ({
    char: char === ' ' ? '\u00A0' : char, // заменяем пробелы на неразрывный пробел
    key: `${char}-${i}`,
  }));
};

const AnimatedText = () => {
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
  const clickTimer = useRef(null);
  const isDoubleClick = useRef(false);

  const before = morphText('Go Event');
  const after = morphText('GayOrgiy Eventovich');
  const current = clicked ? after : before;

  const handleClick = () => {
    isDoubleClick.current = false;

    clickTimer.current = setTimeout(() => {
      if (!isDoubleClick.current) {
        navigate('/');
      }
    }, 250); // 250мс задержки
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current); // отменить переход
    isDoubleClick.current = true;
    setClicked((prev) => !prev); // запускаем анимацию
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="text-yellow-400 text-2xl font-bold cursor-pointer select-none whitespace-nowrap"
    >
      <AnimatePresence mode="popLayout">
        {current.map((item, i) => (
          <motion.span
            key={item.key + (clicked ? '-after' : '-before')}
            initial={{ opacity: 0, y: -20, rotate: -15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, rotate: 15, scale: 1.2 }}
            transition={{
              duration: 0.4,
              delay: i * 0.03,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="inline-block"
          >
            {item.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedText;
