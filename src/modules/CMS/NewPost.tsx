import { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import NumberListIcon from '../../assets/icons/NumberListIcon';
import BulletListIcon from '../../assets/icons/BulletListIcon';
import BoldIcon from '../../assets/icons/BoldIcon';
import ItalicIcon from '../../assets/icons/ItalicIcon';
import UnderlineIcon from '../../assets/icons/UnderlineIcon';
import StrikeThroughIcon from '../../assets/icons/StrikeThroughIcon';
import EmojiIcon from '../../assets/icons/EmojiIcon';
import ImageIcon from '../../assets/icons/ImageIcon';
import UndoIcon from '../../assets/icons/UndoIcon';
import RedoIcon from '../../assets/icons/RedoIcon';
import Button from '../../components/ui/Button';
import Chevronleft from '../../assets/icons/Chevronleft';
import { useNavigate } from 'react-router-dom';

type Props = {};

function NewPost({ }: Props) {
    const icons = Quill.import('ui/icons');

    const OrderedListIconHTML = ReactDOMServer.renderToStaticMarkup(<NumberListIcon color='#4B5C79' />);
    const BulletListIconHTML = ReactDOMServer.renderToStaticMarkup(<BulletListIcon color='#4B5C79' />);
    const boldIconHTML = ReactDOMServer.renderToStaticMarkup(<BoldIcon size={12} color='#4B5C79' />);
    const ItalicIconHTML = ReactDOMServer.renderToStaticMarkup(<ItalicIcon color='#4B5C79' />);
    const UnderlineIconHTML = ReactDOMServer.renderToStaticMarkup(<UnderlineIcon color='#4B5C79' />);
    const StrikeIconHTML = ReactDOMServer.renderToStaticMarkup(<StrikeThroughIcon color='#4B5C79' />);
    const EmojiIconHTML = ReactDOMServer.renderToStaticMarkup(<EmojiIcon color='#4B5C79' />);
    const ImageIconHTML = ReactDOMServer.renderToStaticMarkup(<ImageIcon />);
    const UndoIconHTML = ReactDOMServer.renderToStaticMarkup(<UndoIcon />);
    const RedoIconHTML = ReactDOMServer.renderToStaticMarkup(<RedoIcon />);

    icons['list-ordered'] = OrderedListIconHTML;
    icons['list-bullet'] = BulletListIconHTML;
    icons['bold'] = boldIconHTML;
    icons['italic'] = ItalicIconHTML;
    icons['underline'] = UnderlineIconHTML;
    icons['strike'] = StrikeIconHTML;
    icons['emoji'] = EmojiIconHTML;
    icons['image'] = ImageIconHTML;
    icons['undo'] = UndoIconHTML;
    icons['redo'] = RedoIconHTML;

    const [quillValue, setQuillValue] = useState('');
    const [title, setTitle] = useState('');

    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }], // Font family & size
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Ordered & bullet lists
            ['image'], // Add image
            ['emoji'],
            ['undo', 'redo'],
        ],
        history: { // Enables undo and redo
            delay: 2000,
            maxStack: 500,
            userOnly: true
        },
        'emoji-toolbar': true,
        'emoji-textarea': false,
        'emoji-shortname': true,
    };
    const navigate = useNavigate()
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className='bg-white p-3 rounded-lg grid grid-cols-3'>
       
                <Button onClick={() => navigate(-1)} variant='tertiary' size='sm' className='text-xs border border-[#565148] w-20'>
                    <Chevronleft /> Back
                </Button>
                <div></div>
                <div className='flex gap-2 justify-end'>
                    <Button variant='tertiary' size='sm' className='text-xs border border-[#565148] w-12'>Save</Button>
                    <Button size='sm' className='text-xs border border-[#565148] w-16'>Publish</Button>
                </div>
            </div>

            <div className='w-full mt-6 flex-1' style={{ display: 'flex', flexDirection: 'column' }}>
                <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Add Post Title...'
                    className='w-full p-2 border outline-none border-gray-300 rounded-lg text-[#4B5C79] text-lg font-semibold'
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                    <ReactQuill
                        value={quillValue}
                        onChange={setQuillValue}
                        placeholder='Write your message here...'
                        className='quill-editor text-[#4B5C79] bg-white p-2 rounded-lg text-sm font-normal'
                        theme='snow'
                        modules={modules}
                        style={{ flex: 1, height: '100%', minHeight: '100%', overflow: 'hidden' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default NewPost;