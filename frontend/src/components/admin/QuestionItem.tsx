import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

interface QuestionItemProps {
  question: Question;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Sortable question item with drag handle.
 */
export function QuestionItem({ question, categoryName, onEdit, onDelete }: QuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="px-6 py-4">
      <div className="flex items-start space-x-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 hover:text-gray-600 mt-1"
          title="Drag to reorder"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">#{question.order}</span>
            <p className="text-sm text-gray-900">{question.text}</p>
            {!question.active && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{categoryName}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
