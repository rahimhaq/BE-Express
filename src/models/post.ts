export interface Post {
  id: number;
  title: string;
  body: string;
  author?: string;
  createdAt: string;
}

let posts: Post[] = [
  {
    id: 1,
    title: "Hello World",
    body: "Ini post pertama.",
    author: "Rahim",
    createdAt: new Date().toISOString()
  }
];

export const PostModel = {
  findAll(): Post[] {
    return posts;
  },
  findById(id: number): Post | undefined {
    return posts.find(p => p.id === id);
  },
  create(data: Omit<Post, "id" | "createdAt">): Post {
    const nextId = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const newPost: Post = { id: nextId, createdAt: new Date().toISOString(), ...data };
    posts.push(newPost);
    return newPost;
  },
  delete(id: number): boolean {
    const before = posts.length;
    posts = posts.filter(p => p.id !== id);
    return posts.length < before;
  }
};
