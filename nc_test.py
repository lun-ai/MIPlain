import minimax_DB as nc

example = [1,1,0,2,0,2,2,1,1]
print('Original')
nc.visualize_board(example)

acw_90 = nc.rotate_90_ACW(example)
print('Rotate ACW 90: ')
nc.visualize_board(acw_90)

acw_180 = nc.rotate_90_ACW(acw_90)
print('Rotate ACW 180: ')
nc.visualize_board(acw_180)

acw_270 = nc.rotate_90_ACW(acw_180)
print('Rotate ACW 270: ')
nc.visualize_board(acw_270)

horizontal_sym = nc.horizontal_mirror(example)
print('Horizontal symmetry: ')
nc.visualize_board(horizontal_sym)

vertical_sym = nc.veritical_mirror(example)
print('Vertical symmetry: ')
nc.visualize_board(vertical_sym)

left_diag_sym = nc.left_diagonal_sym(example)
print('Left diagonal symmetry: ')
nc.visualize_board(left_diag_sym)

right_diag_sym = nc.right_diagonal_sym(example)
print('Right diagonal symmetry: ')
nc.visualize_board(right_diag_sym)
