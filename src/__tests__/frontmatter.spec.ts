import { getDisplayFrontmatter } from '../frontmatter';

describe('getDisplayFrontmatter', () => {
  it('drops a title that is still present in the content', () => {
    const result = getDisplayFrontmatter({
      title: 'Perturbation study',
      content_includes_title: true
    });
    expect(result?.title).toBeUndefined();
  });

  it('keeps the other fields when it drops the title', () => {
    const result = getDisplayFrontmatter({
      title: 'Perturbation study',
      content_includes_title: true,
      date: '2026-01-01'
    });
    expect(result?.date).toEqual('2026-01-01');
  });

  it('keeps a title that was removed from the content', () => {
    const result = getDisplayFrontmatter({
      title: 'Notebook title',
      content_includes_title: false
    });
    expect(result?.title).toEqual('Notebook title');
  });

  it('keeps a title given in the frontmatter itself', () => {
    const result = getDisplayFrontmatter({ title: 'Explicit title' });
    expect(result?.title).toEqual('Explicit title');
  });

  it('passes undefined through', () => {
    expect(getDisplayFrontmatter(undefined)).toBeUndefined();
  });

  it('does not modify the frontmatter it was given', () => {
    const frontmatter = {
      title: 'Perturbation study',
      content_includes_title: true
    };
    getDisplayFrontmatter(frontmatter);
    expect(frontmatter.title).toEqual('Perturbation study');
  });
});
