/**
 * The English catalog, and the source of truth for the key set: every other
 * language is typed as a complete `Record<TTranslationKey, string>`, so adding
 * a key here makes the compiler ask for it everywhere else.
 *
 * `{name}` placeholders are substituted by the translate function.
 */
const en = {
  // Saving
  'save.save': 'Save',
  'save.saving': 'Saving…',
  'save.saved': 'Saved',
  'save.retry': 'Retry save',
  'save.failed': 'The last save failed.',

  // Inspector chrome
  'inspector.tab.styles': 'Styles',
  'inspector.tab.inspect': 'Inspect',
  'inspector.toggle': 'Toggle inspector panel',
  'inspector.empty': 'Click on a block to inspect.',
  'inspector.blockNotFound': 'Block with id {id} was not found. Click on a block to reset.',
  'inspector.rootNotFound': 'Block not found',

  // Canvas chrome
  'canvas.addBlock': 'Add block',
  'canvas.moveUp': 'Move up',
  'canvas.moveDown': 'Move down',
  'canvas.duplicate': 'Duplicate',
  'canvas.delete': 'Delete',

  // Add-block menu
  'block.Heading': 'Heading',
  'block.Text': 'Text',
  'block.Button': 'Button',
  'block.Image': 'Image',
  'block.Avatar': 'Avatar',
  'block.Divider': 'Divider',
  'block.Spacer': 'Spacer',
  'block.Table': 'Table',
  'block.Html': 'Html',
  'block.ColumnsContainer': 'Columns',
  'block.Container': 'Container',

  // Inspector panel titles
  'panel.EmailLayout': 'Global',
  'panel.Heading': 'Heading block',
  'panel.Text': 'Text block',
  'panel.Button': 'Button block',
  'panel.Image': 'Image block',
  'panel.Avatar': 'Avatar block',
  'panel.Divider': 'Divider block',
  'panel.Spacer': 'Spacer block',
  'panel.Table': 'Table block',
  'panel.Html': 'Html block',
  'panel.ColumnsContainer': 'Columns block',
  'panel.Container': 'Container block',

  // Field labels
  'field.alignment': 'Alignment',
  'field.altText': 'Alt text',
  'field.backdropColor': 'Backdrop color',
  'field.backgroundColor': 'Background color',
  'field.borderColor': 'Border color',
  'field.borderRadius': 'Border radius',
  'field.borderWidth': 'Border width',
  'field.buttonColor': 'Button color',
  'field.canvasBorderColor': 'Canvas border color',
  'field.canvasBorderRadius': 'Canvas border radius',
  'field.canvasColor': 'Canvas color',
  'field.cellPadding': 'Cell padding',
  'field.clickThroughUrl': 'Click through URL',
  'field.color': 'Color',
  'field.column': 'Column {number}',
  'field.columnsGap': 'Columns gap',
  'field.content': 'Content',
  'field.fontFamily': 'Font family',
  'field.fontSize': 'Font size',
  'field.fontWeight': 'Font weight',
  'field.headerBackgroundColor': 'Header background',
  'field.headerRow': 'Header row',
  'field.headerTextColor': 'Header text color',
  'field.height': 'Height',
  'field.imageUrl': 'Image URL',
  'field.level': 'Level',
  'field.markdown': 'Markdown (GitHub flavored)',
  'field.minRowHeight': 'Minimum row height',
  'field.numberOfColumns': 'Number of columns',
  'field.padding': 'Padding',
  'field.shape': 'Shape',
  'field.size': 'Size',
  'field.sourceUrl': 'Source URL',
  'field.stripedRowColor': 'Striped rows',
  'field.style': 'Style',
  'field.text': 'Text',
  'field.textColor': 'Text color',
  'field.url': 'Url',
  'field.width': 'Width',

  // Option labels
  'option.shape.circle': 'Circle',
  'option.shape.square': 'Square',
  'option.shape.rounded': 'Rounded',
  'option.width.full': 'Full',
  'option.width.auto': 'Auto',
  'option.size.xSmall': 'Xs',
  'option.size.small': 'Sm',
  'option.size.medium': 'Md',
  'option.size.large': 'Lg',
  'option.buttonStyle.rectangle': 'Rectangle',
  'option.buttonStyle.rounded': 'Rounded',
  'option.buttonStyle.pill': 'Pill',
  'option.fontWeight.regular': 'Regular',
  'option.fontWeight.bold': 'Bold',
  'option.fontFamily.inherit': 'Match email settings',
  'option.align.top': 'Align top',
  'option.align.middle': 'Align middle',
  'option.align.bottom': 'Align bottom',
  'option.align.left': 'Align left',
  'option.align.center': 'Align center',
  'option.align.right': 'Align right',

  // Table canvas controls
  'table.addRow': 'Row',
  'table.addColumn': 'Column',
  'table.deleteRow': 'Delete row',
  'table.deleteColumn': 'Delete column',
  'table.resizeColumn': 'Resize column',

  // Image library
  'imageLibrary.choose': 'Choose image…',
  'imageLibrary.title': 'Choose an image',
  'imageLibrary.dropzone': 'Drop an image here, or click to choose a file',
  'imageLibrary.uploading': 'Uploading…',
  'imageLibrary.search': 'Search',
  'imageLibrary.searchPlaceholder': 'Search the library…',
  'imageLibrary.loading': 'Loading…',
  'imageLibrary.loadMore': 'Load more',
  'imageLibrary.empty': 'No images found.',
  'imageLibrary.select': 'Select',
  'imageLibrary.cancel': 'Cancel',
  'imageLibrary.retry': 'Try again',
  'imageLibrary.error.load': 'The image library could not be loaded.',
  'imageLibrary.error.upload': 'The upload failed.',
  'imageLibrary.error.pick': 'No image could be chosen.',
  'imageLibrary.error.type': '{name} is not an accepted image type.',
  'imageLibrary.error.tooLarge': '{name} is larger than the limit of {limit}.',

  // Inputs
  'input.auto': 'auto',
  'input.clear': 'Clear {label}',
  'input.value': 'Value',
} as const;

export default en;
