import { useState, useEffect, useRef, FC } from 'react';
import Styles from "@/app/admin/admin.module.css";
import { createClient } from '@/lib/supabase/client';
import { LuX, LuTag, LuUpload } from "react-icons/lu";


type TagRow = { name: string };

const supabase = createClient();

const TagInput: FC = () => {
  const [tags, setTags] = useState<string[]>(['Javascript', 'ReactJs']); // Current selected tags
  const [defaultTags, setDefaultTags] = useState<TagRow[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  
  const onEnterInput = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newTag = inputValue.replace(/\s+/g, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('name');
      if (error) {
        console.error('Error fetching tags:', error);
        return;
      }
      console.log('Fetched tags:', data);
      setDefaultTags(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  useEffect(() => {
    fetchSuggestions();
  }, []);
  
  return(
    <div className={Styles.tagInput}>
      <div className={`${Styles.tagInputTags} overflow-hidden`}>
        {tags.map((tag, index) => (
          <span key={index}>
            {tag} 
            <LuX onClick={() => removeTag(tag)} style={{ cursor: 'pointer', marginLeft: '4px' }}/>
          </span>
        ))}
      </div>
      <form onSubmit={(e)=>{onEnterInput(e)}}>
        <input type="text" placeholder="Enter Tags for blog..." list="TagSuggestion" value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} enterKeyHint="done"/>
      </form>
      <datalist id="TagSuggestion">
        {defaultTags.map((tag, index) => (
          <option key={index} value={tag.name}>{tag.name}</option>
        ))}
      </datalist>
    </div>
  );
};

export default TagInput;