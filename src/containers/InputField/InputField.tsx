import React, { useState, useCallback, useRef } from 'react';

import {
	Wrapper,
	Form,
	Input,
	TextArea,
} from 'containers/InputField/InputElements';
import Tool from 'containers/Toolbar/Tool/Tool';
import Toolbar from 'containers/Toolbar/Toolbar';
import { ToolbarContainer } from 'containers/Note/NoteElements';
import Label from 'containers/Label/Label';
import NoteLabel from 'containers/Label/LabelElements/NoteLabel/NoteLabel';
import TodoList from 'components/TodoList/TodoList';
import { convertNoteToTodo } from 'shared/utility';
import { addNoteToStore } from 'shared/firebase';
import { storageService } from '../../fbase';
import { useClickOutside } from 'hooks/useClickOutside';
import { Todo, ToggleTool, Note } from 'shared/types';
import { Modal } from './Modal';
type UpdateNoteEvent =
	| React.ChangeEvent<HTMLTextAreaElement>
	| React.ChangeEvent<HTMLInputElement>;

const INITIAL_NOTE: Note = {
	title: '',
	content: '',
	bgColor: '#fff',
	isChecked: false,
	isPinned: false,
	isArchived: false,
	labels: [],
	imgUrl: ''
};

const InputField = () => {
	const [note, setNote] = useState<Note>(INITIAL_NOTE);
	const { title, content, id, bgColor, isChecked, isPinned, labels } = note;
	const [showLabel, setShowLabel] = useState(false);
	const [showImage, setShowImage] = useState(false);
	const [file, setFile] = useState('');
	const [uploadFile, setuploadFile] = useState({ name: "" });
	const [filename, setfilename] = useState('');
	const [modalShow, setModalShow] = useState(false);
	const inputFile = useRef(null);
	const [url, setURL] = useState("");

	const {
		ref,
		isClickOutside: isExpand,
		handleResetClick,
		setIsClickOutside,
	} = useClickOutside(false);

	const handleResetNote = useCallback((): void => {
		setNote({ ...INITIAL_NOTE });
	}, []);

	const handleUpdateNote = useCallback(
		(e: UpdateNoteEvent): void => {
			const { name, value } = e.target;
			setNote({ ...note, [name]: value });
		},
		[note],
	);

	const handleToggle = useCallback(
		(toolType: ToggleTool): void => {
			setNote({ ...note, [toolType]: !note[toolType] });
		},
		[note],
	);

	const handleChangeColor = useCallback(
		(color: string): void => {
			setNote({ ...note, bgColor: color });
		},
		[note],
	);

	type NoteLabel = string[] | object[];

	const handleAddLabel = useCallback(
		async (label: string): Promise<void> => {
			const newLabels: string[] = labels.concat(label);
			setNote({ ...note, labels: newLabels });
		},
		[labels, note],
	);

	const handleRemoveLabel = useCallback(
		(label: string): void => {
			const newLabels: string[] = labels.filter((l: string) => l !== label);
			setNote({ ...note, labels: newLabels });
		},
		[note, labels],
	);
	const InputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

		const { files } = event.target;
		if (files !== null) {

			var reader = new FileReader();
			if (reader !== null) {
				reader.onloadend = function (e: any) {
					if (reader.result !== null) {
						// or simply:
						const csv = reader.result; // `string | ArrayBuffer` type is inferred for you
						if (typeof csv === 'string') { setFile(csv) }
						else { setFile(csv.toString()) }
						setShowImage(true);
					}
				}
				reader.readAsDataURL(files[0]);
			}
			// setImageAsFile(imageFile => (event.target.files[0]));
			setuploadFile(files[0]);
			setfilename(files[0].name);

		}
	}
	const handleAddNote = useCallback(
		async (
			e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
			note: Note,
		): Promise<void> => {
			e.preventDefault();
			if (title !== '' && content !== '') {
				const u_file = inputFile.current;
				if (typeof u_file === 'object' && u_file !== null) {
					const refs = storageService.ref(`/images/${filename}`);
					const  {files}  = u_file;
					console.log(u_file);
					if (files !== null) {
						const uploadTask = refs.put(files[0]);
						uploadTask.on("state_changed", console.log, console.error, () => {
							refs
								.getDownloadURL()
								.then((url) => {
									// setFile(null);
									setURL(url);
									handleResetNote();
									setShowLabel(false);
									handleResetClick();
									setNote({ ...note, imgUrl: url });
									const t_note = {...note};
									t_note.imgUrl = url;
									console.log(t_note);
									addNoteToStore(t_note);
									setShowImage(false);
								});
						});
					}
				}
			}
		},
		[title, content, handleResetNote, handleResetClick],
	);


	// TEXT FIELD
	let textField;
	if (isChecked) {
		const todos: Todo[] | undefined = convertNoteToTodo(content);
		textField = <TodoList todoContent={todos} setNote={setNote} isInputField />;
	}

	if (!isChecked) {
		textField = (
			<TextArea
				name="content"
				rows={3}
				placeholder="Take a note..."
				value={content}
				onChange={handleUpdateNote}
			/>
		);
	}

	const modalhide = () => {
		setModalShow(false);
	}
	const modal_content = <React.Fragment>Hey, I'm a model.</React.Fragment>;
	return (
		<Wrapper>
			<Form ref={ref} bgColor={bgColor}>
				<Input
					name="title"
					value={title}
					placeholder="Title"
					autoComplete="off"
					onChange={handleUpdateNote}
				/>
				<Tool
					inputPin
					isInputField
					title="Pin Note"
					isPinned={isPinned}
					onToggle={handleToggle}
				/>
				<Modal isShown={modalShow} modalContent={modal_content} headerText="asdf" hide={modalhide} />
				{isExpand && (
					<div>
						<form>
							<input className="file" type="file" onChange={InputChange} style={{ display: "none", width: "100%" }} ref={inputFile} />
						</form>
						{showImage && <img src={file} style={{ maxWidth: "100%", maxHeight: "100%" }} alt="Upload Image" />}
						{textField}
						{labels.length > 0 && (
							<NoteLabel
								isInputField
								id={id && id}
								labels={labels}
								onRemove={handleRemoveLabel}
							/>
						)}
						<ToolbarContainer>
							<Toolbar
								id={id}
								isInputField
								onHover={true}
								onAddNote={(e) => handleAddNote(e, note)}
								onToggle={handleToggle}
								onClick={handleChangeColor}
								setShowLabel={setShowLabel}
								setShowImage={setShowImage}
								setModalShow={setModalShow}
								inputFile={inputFile}

							/>
							{showLabel && (
								<Label
									note={note}
									isInputField
									addLabelToInputField={handleAddLabel}
									setShowLabel={setShowLabel}
									onRemove={handleRemoveLabel}
									onExpand={setIsClickOutside}
								/>
							)}
						</ToolbarContainer>
					</div>
				)}
			</Form>
		</Wrapper>
	);
};

export default React.memo(InputField);
