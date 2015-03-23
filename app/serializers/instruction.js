import DS from 'ember-data';

export default DS.LSSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    subInstructions: { embedded: 'always' }
  }
});
