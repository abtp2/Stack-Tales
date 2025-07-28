import { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import Styles from "@/app/admin/admin.module.css";
import { createClient } from '@/lib/supabase/client';
import { LuX, LuTag, LuUpload, LuLoaderCircle } from "react-icons/lu";

type TagRow = { name: string };

const supabase = createClient();
interface TagInputProps {
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
}


const TagInput: FC<TagInputProps> =({
  blogTags,
  setBlogTags,
})=> {
  const [defaultTags, setDefaultTags] = useState<TagRow[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [uploadingTags, setUploadingTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);

  const onEnterInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newTag = inputValue.trim().replace(/\s+/g, '');
    if (newTag && !blogTags.includes(newTag)) {
      setBlogTags([...blogTags, newTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    setBlogTags(blogTags.filter(tag => tag !== tagToRemove));
  };

  const addTagFromSuggestion = (tagName: string) => {
    if (!blogTags.includes(tagName)) {
      setBlogTags([...blogTags, tagName]);
    }
    setInputValue('');
  };

  const uploadTagToDatabase = async (tagName: string) => {
    setUploadingTags(prev => [...prev, tagName]);

    try {
      const { error } = await supabase
        .from('tags')
        .insert({ name: tagName });

      if (error) {
        console.error('Error uploading tag:', error);
        return;
      }

      console.log('Tag uploaded successfully:', tagName);
      await fetchSuggestions();
    } catch (err) {
      console.error('Unexpected error uploading tag:', err);
    } finally {
      setUploadingTags(prev => prev.filter(tag => tag !== tagName));
    }
  };

  const fetchSuggestions = async () => {
    try {
      setIsLoadingTags(true);
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
    } finally {
      setIsLoadingTags(false);
    }
  };

  const isDefaultTag = (tagName: string) => {
    return defaultTags.some(defaultTag => defaultTag.name === tagName);
  };

  const filteredTags = defaultTags.filter(tag =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase().trim()) &&
    !blogTags.includes(tag.name)
  );

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className={Styles.tagInput}>
      <div className={`${Styles.tagInputTags} overflow-none`}>
        {blogTags.map((tag, index) => (
          <span key={index}>
            {tag}
            {!isLoadingTags && !isDefaultTag(tag) && (
              uploadingTags.includes(tag) ? (
                <LuLoaderCircle
                  className="animate-spin"
                  style={{ marginLeft: '4px', marginRight: '4px' }}
                />
              ) : (
                <LuUpload
                  onClick={() => uploadTagToDatabase(tag)}
                  style={{ cursor: 'pointer', marginLeft: '4px', marginRight: '4px' }}
                />
              )
            )}
            <LuX onClick={() => removeTag(tag)} style={{ cursor: 'pointer', marginLeft: '4px' }} />
          </span>
        ))}
      </div>
      <form onSubmit={onEnterInput}>
        <input
          type="text"
          placeholder="Write Tag(s) for blog & press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          enterKeyHint="done"
        />
      </form>
      {inputValue.trim() && filteredTags.length > 0 && (
        <div className={Styles.tagInputSuggestions}>
          {filteredTags.map((tag, index) => (
            <span
              key={index}
              onClick={() => addTagFromSuggestion(tag.name)}
              style={{ cursor: 'pointer' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;