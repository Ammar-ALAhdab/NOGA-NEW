import React, { useState } from 'react';
import ButtonComponent from './ButtonComponent';

function CopyToClipboard({text}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 5000); // إعادة تعيين حالة النسخ بعد 2 ثانية
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div>
            {copied ?
                <span style={{ color: 'green', marginLeft: '10px' }}>تم النسخ!</span>
                :
                <ButtonComponent small={true} textButton={'نسخ'} onClick={handleCopy} />
            }
        </div>
    );
}

export default CopyToClipboard;
