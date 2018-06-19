// @flow
export type User = {
  username: string,
  password: string,
  user_group: string,
  serial: string,
  favorited_games: [{}],
  signed_games: [{}],
  entered_games: [{}],
  created: Date | null,
}