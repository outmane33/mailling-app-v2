exports.sanitizeUser = (user) => {
  return {
    _id: user._id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  };
};
